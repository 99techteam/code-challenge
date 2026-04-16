import type { Request, Response } from "express";
import mongoose from "mongoose";

import { ResourceModel } from "../models/resource.js";

function buildPayload(document: unknown) {
  return document;
}

export async function createResource(request: Request, response: Response) {
  const resource = await ResourceModel.create({
    name: request.body.name,
    value: request.body.value,
    description: request.body.description ?? "",
    status: request.body.status ?? 1,
    detail: request.body.detail ?? {}
  });

  response.status(201).json({
    success: true,
    data: buildPayload(resource.toJSON())
  });
}

export async function listResources(request: Request, response: Response) {
  const filters: Record<string, unknown> = {};

  if (typeof request.query.name === "string" && request.query.name.trim() !== "") {
    filters.name = {
      $regex: request.query.name.trim(),
      $options: "i"
    };
  }

  if (typeof request.query.status === "string" && request.query.status !== "") {
    filters.status = Number(request.query.status);
  }

  const items = await ResourceModel.find(filters).sort({ updatedAt: -1, createdAt: -1 }).lean();

  response.json({
    success: true,
    data: {
      items: items.map((item) => ({
        ...item,
        id: item._id.toString(),
        _id: undefined
      })),
      total: items.length
    }
  });
}

export async function getResource(request: Request, response: Response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    response.status(404).json({
      success: false,
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Resource was not found."
      }
    });
    return;
  }

  const resource = await ResourceModel.findById(request.params.id);

  if (!resource) {
    response.status(404).json({
      success: false,
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Resource was not found."
      }
    });
    return;
  }

  response.json({
    success: true,
    data: buildPayload(resource.toJSON())
  });
}

export async function updateResource(request: Request, response: Response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    response.status(404).json({
      success: false,
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Resource was not found."
      }
    });
    return;
  }

  const resource = await ResourceModel.findByIdAndUpdate(
    request.params.id,
    {
      $set: {
        ...(request.body.name !== undefined ? { name: request.body.name } : {}),
        ...(request.body.value !== undefined ? { value: request.body.value } : {}),
        ...(request.body.description !== undefined ? { description: request.body.description } : {}),
        ...(request.body.status !== undefined ? { status: request.body.status } : {}),
        ...(request.body.detail !== undefined ? { detail: request.body.detail } : {})
      }
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!resource) {
    response.status(404).json({
      success: false,
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Resource was not found."
      }
    });
    return;
  }

  response.json({
    success: true,
    data: buildPayload(resource.toJSON())
  });
}

export async function deleteResource(request: Request, response: Response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    response.status(404).json({
      success: false,
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Resource was not found."
      }
    });
    return;
  }

  const resource = await ResourceModel.findByIdAndDelete(request.params.id);

  if (!resource) {
    response.status(404).json({
      success: false,
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Resource was not found."
      }
    });
    return;
  }

  response.status(204).send();
}
