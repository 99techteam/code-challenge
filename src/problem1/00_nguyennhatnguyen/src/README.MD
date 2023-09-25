Sum 1 to 159 (n = 159 > 20)

0    01 + ... + 09  =>  10*0   + (10*0  + 1)  + ... + (10*0   + 9)    => 10*0   +  10*0*9  + (1 + ... + 9)
10   11 + ... + 19  =>  10*1   + (10*1  + 1)  + ... + (10*1   + 9)    => 10*1   +  10*1*9  + (1 + ... + 9)
20   21 + ... + 29  =>  10*2   + (10*2  + 1)  + ... + (10*2   + 9)    => 10*2   +  10*2*9  + (1 + ... + 9)
30   31 + ... + 39  =>  10*3   + (10*3  + 1)  + ... + (10*3   + 9)    => 10*3   +  10*3*9  + (1 + ... + 9)
....
150  151+ ... + 159 =>  10*15  + (10*15 + 1)  + ... + (10*15  + 9)    => 10*15  +  10*15*9 + (1 + ... + 9)
=======
SUM:

(1 + ... + 9) + 10*9*(1 + ... + 15) + (1 + ... + 9)*15
-------------   --------------------------------------
This is the     This is the sum from 10 to 159
sum 1->9


========
A. So how to formulize it:

1. Calculate the n modulo 10:
    `const modTen = n % 10;`
    In this example, n is 159, so `modTen` = 159 % 10 = 9
2. Minus the n with 9:
    `const numberWithoutMod = n - modTen;` => `numberWithoutMod` = 159 - 9 = 150
3. Calculate the count of sum from 10 to n, here is 10 to 159
    `const count = numberWithoutMod / 10;` => `count` = 150 / 10 = 15;


Formula is:
`(1+ ... + 9) + 10*modTen*(1 + ... + count) + (1 + ... + 9)*count`

============
B. But the n modulo 10 is not always equal 9, it may be less than 9, so, we have another formula:
Example: sum from 1 -> 133, n = 133

1. Calculate the n modulo 10:
    `const modTen = n % 10;`
    In this example, n is 133, so `modTen` = 133 % 10 = 3
2. Minus the n with 3:
    `const numberWithoutMod = n - modTen;` => `numberWithoutMod` = 133 - 3 = 130
3. Calculate the count of sum from 10 to n, here is 10 to 133
    `const count = numberWithoutMod / 10;` => `count` = 133 / 10 = 13;

    SUM: (1 + ... + 9) + 10*9*(1 + ... + 14) + (1 + ... + 9)*14 + 10*3*count + (1 + ... + 3)


`(1+ ... + 9) + 10*9*(1 + ... + (count - 1)) + (1 + ... + 9)*(count - 1) + 10*modTen*count + (1 + ... + modTen)`
 ------------   --------------------------------------------------------   ------------------------------------

=========
With (B), we can do the recursive to calculate
