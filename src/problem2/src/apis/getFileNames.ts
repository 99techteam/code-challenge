import axios from "axios";

export interface IGetFileNamesResponse {
  sha: string;
  url: string;
  tree: Tree[];
  truncated: boolean;
}

export interface Tree {
  path: string;
  mode: string;
  type: string;
  sha: string;
  url: string;
  size?: number;
}

export const getFileNames = async (): Promise<string[]> => {
  const resp = await axios.get<IGetFileNamesResponse>(
    `https://api.github.com/repos/Switcheo/token-icons/git/trees/main?recursive=1`
  );
  return resp.data.tree
    .filter((t) => t.path.startsWith("tokens/"))
    .map((t) => t.path.replace("tokens/", "").replace(".svg", ""));
};
