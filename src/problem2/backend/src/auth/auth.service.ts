import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { SwapDto } from '../dto/swap.dto';
import { TransferDto } from '../dto/transfer.dto';
import { EXCHANGE_RATES, isValidCurrency } from '../constants/tokens';
import { generateWalletAddress } from '../utils/wallet.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate wallet address
    const walletAddress = generateWalletAddress();

    // Create user with initial token balance of 100 USD and wallet address
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      walletAddress,
      tokenBalances: [{ symbol: 'USD', amount: 100 }],
    });

    await this.userRepository.save(user);

    // Generate JWT token
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        walletAddress: user.walletAddress,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        walletAddress: user.walletAddress,
      },
    };
  }

  async getUserProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      walletAddress: user.walletAddress,
      tokenBalances: user.tokenBalances,
    };
  }

  async getUserBalances(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      username: user.username,
      email: user.email,
      walletAddress: user.walletAddress,
      tokenBalances: user.tokenBalances,
    };
  }

  async swapTokens(userId: number, swapDto: SwapDto) {
    const { fromToken, toToken, amount } = swapDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Validate tokens using centralized token data
    if (!isValidCurrency(fromToken) || !isValidCurrency(toToken)) {
      throw new BadRequestException('Invalid token. Please select a supported currency.');
    }

    // Find from token balance
    const fromBalance = user.tokenBalances.find((b) => b.symbol === fromToken);
    if (!fromBalance || fromBalance.amount < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Calculate conversion using actual market prices from priceData
    const fromValueInUSD = amount * EXCHANGE_RATES[fromToken];
    const toAmount = fromValueInUSD / EXCHANGE_RATES[toToken];

    // Update balances
    const newBalances = user.tokenBalances.map((b) => {
      if (b.symbol === fromToken) {
        // Deduct from source token
        return { ...b, amount: b.amount - amount };
      }
      return b;
    });

    // Find or add destination token
    const toBalance = newBalances.find((b) => b.symbol === toToken);
    if (toBalance) {
      toBalance.amount += toAmount;
    } else {
      newBalances.push({ symbol: toToken, amount: toAmount });
    }

    // Remove zero balances
    user.tokenBalances = newBalances.filter((b) => b.amount > 0.000001);

    // Save
    await this.userRepository.save(user);

    return {
      message: 'Swap successful',
      swap: {
        from: { symbol: fromToken, amount },
        to: { symbol: toToken, amount: toAmount },
      },
      newBalances: user.tokenBalances,
    };
  }

  async transferTokens(senderId: number, transferDto: TransferDto) {
    const { recipientWalletAddress, tokenSymbol, amount } = transferDto;

    // Find sender
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    if (!sender) {
      throw new UnauthorizedException('Sender not found');
    }

    // Find recipient by wallet address
    const recipient = await this.userRepository.findOne({ where: { walletAddress: recipientWalletAddress } });
    if (!recipient) {
      throw new BadRequestException('Recipient wallet address not found');
    }

    // Prevent self-transfer
    if (sender.id === recipient.id) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    // Validate token
    if (!isValidCurrency(tokenSymbol)) {
      throw new BadRequestException('Invalid token symbol');
    }

    // Check sender balance
    const senderBalance = sender.tokenBalances.find((b) => b.symbol === tokenSymbol);
    if (!senderBalance || senderBalance.amount < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Deduct from sender
    const newSenderBalances = sender.tokenBalances.map((b) => {
      if (b.symbol === tokenSymbol) {
        return { ...b, amount: b.amount - amount };
      }
      return b;
    });

    // Remove zero balances from sender
    sender.tokenBalances = newSenderBalances.filter((b) => b.amount > 0.000001);

    // Add to recipient
    const recipientBalance = recipient.tokenBalances.find((b) => b.symbol === tokenSymbol);
    if (recipientBalance) {
      recipientBalance.amount += amount;
    } else {
      recipient.tokenBalances.push({ symbol: tokenSymbol, amount });
    }

    // Save both users
    await this.userRepository.save(sender);
    await this.userRepository.save(recipient);

    return {
      message: 'Transfer successful',
      transfer: {
        from: sender.username,
        to: recipient.username,
        token: tokenSymbol,
        amount,
      },
      newBalance: sender.tokenBalances,
    };
  }
}
