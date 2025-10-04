export interface IBaseModel {
  id: string;
  delFlg: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResponseSuccess {
  success: boolean | true;
  message?: string;
  detail?: string;
}

export interface IResponseCommon<ResultType> {
  result: ResultType;
  meta:
    | {
        total: number;
        offset: number;
        limit: number;
      }
    | {};
}
