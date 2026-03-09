import fs from "fs";

const convertFilesToArray = (path, data) => {
    return data.map((file) => {
        return {
            name: file.replace(".svg", ""),
            path: `./${path}/${file}`,
        };
    });
};

const generateImportImage = () => {
    const tokenImageFiles = fs.readdirSync("src/assets/img/tokens");

    const tokenImagesArray = convertFilesToArray("tokens", tokenImageFiles);

    const content = `${tokenImagesArray
        .map((image) => `import ${image.name} from '${image.path}';`)
        .join(
            "\n"
        )} export const images: { [key: string]: string }  = { ${tokenImagesArray
        .map((image) => `${image.name},`)
        .join("\n")}}`;

    fs.writeFile("src/assets/img/index.ts", content, (err) => {
        if (err) {
            throw err;
        }
        console.log("Content written to 'src/assets/images/index.ts'");
    });
};

generateImportImage();
