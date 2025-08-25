abstract class BaseController<TService> {
	constructor(protected service: TService) {}
}

export default BaseController;
