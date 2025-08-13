import type express from "express";
import { parseAsync } from "zod";
import { BadRequestException } from "../../exceptions/bad-request.exception";
import type { CreateResourceDto } from "./dto/create-resource.dto";
import type { FindResourceByIdDto } from "./dto/find-resource-by-id.dto";
import * as findResourcesDto from "./dto/find-resources.dto";
import type { UpdateResourceDto } from "./dto/update-resource.dto";
import type { ResourceService } from "./resource.service";

export class ResourceController {
	constructor(private readonly userService: ResourceService) {}

	async getResources(req: express.Request, res: express.Response) {
		let dto: findResourcesDto.FindResourcesDto;
		try {
			dto = await parseAsync(findResourcesDto.findResourcesSchema, req.query);
		} catch {
			throw new BadRequestException("Invalid query schema");
		}
		const resources = await this.userService.find(dto);
		return res.json(resources);
	}

	async getResource(req: express.Request, res: express.Response) {
		const dto = req.params as unknown as FindResourceByIdDto;
		const resource = await this.userService.findOne(dto.id);
		return res.json(resource);
	}

	async createResource(req: express.Request, res: express.Response) {
		const dto: CreateResourceDto = req.body;
		const createdResource = await this.userService.create(dto);
		return res.json(createdResource);
	}

	async updateResource(req: express.Request, res: express.Response) {
		const { id } = req.params as unknown as FindResourceByIdDto;
		const dto: UpdateResourceDto = req.body;
		const updatedResource = await this.userService.update(id, dto);
		return res.json(updatedResource);
	}

	async softDelete(req: express.Request, res: express.Response) {
		const dto = req.params as unknown as FindResourceByIdDto;
		const deletedResource = await this.userService.softDelete(dto.id);
		return res.json(deletedResource);
	}

	// async deletePermanently(req: Request, res: Response) {
	//   const dto = req.params as unknown as FindResourceByIdDto;
	//   const deletedResource = await this.userService.deletePermanently(dto.id);
	//   return res.json(deletedResource);
	// }

	async restore(req: express.Request, res: express.Response) {
		const dto = req.params as unknown as FindResourceByIdDto;
		const deletedResource = await this.userService.restore(dto.id);
		return res.json(deletedResource);
	}
}
