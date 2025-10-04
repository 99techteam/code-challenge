export const cookieProps = {
  key: "token",
  secret: process.env.COOKIE_SECRET,
  options: {
    httpOnly: true,
    signed: true,
    path: process.env.COOKIE_PATH,
    maxAge: Number(process.env.COOKIE_EXP),
    domain: process.env.COOKIE_DOMAIN,
    secure: process.env.SECURE_COOKIE === "true",
  },
} as const;

export interface IObject<T = unknown> {
  [key: string]: T;
}

export const DEFAULT_USER_PW = "123123123";
export const PW_SALT = "TyYosQyr5vGN";

// data enum
export const DELETE_FLG = {
  VALID: 0,
  DELETED: 1,
} as const;

export const ERROR_MESSAGE = {
  INTERNAL_SERVER_ERROR: "Internal server error",
  RESOURCE_NOT_FOUND: "Resource not found",
  RESOURCE_CREATION_FAILED: "Resource creation failed",
  RESOURCE_UPDATE_FAILED: "Resource update failed",
  RESOURCE_DELETION_FAILED: "Resource deletion failed",
  RESOURCE_ERR_PARAMS_MISSING: "Required parameters are missing",
};
