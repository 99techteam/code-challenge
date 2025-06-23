import React from "react";
import { icons } from "../utils/getIcon";

interface IconProps {
	name: string;
	size?: number;
	alt?: string;
	style?: React.CSSProperties;
}

const Image: React.FC<IconProps> = ({ name, size = 24, alt = "token", style }) => (
	<img
		src={icons[name]}
		alt={alt || name}
		width={size}
		height={size}
		style={style}
		draggable={false}
	/>
);

export default Image;
