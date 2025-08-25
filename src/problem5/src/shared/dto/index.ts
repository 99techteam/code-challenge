import { plainToInstance, ClassConstructor } from 'class-transformer';

const plainObject = <T, V>(
	dto: ClassConstructor<T>,
	entity: V | V[],
	excludeExtraneousValues = true,
	enableImplicitConversion = true,
) => {
	return plainToInstance(dto, entity, {
		excludeExtraneousValues,
		enableImplicitConversion,
		exposeUnsetFields: false,
	});
};

export { plainObject };
