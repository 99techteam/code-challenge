import React, { useState, useEffect, useRef } from 'react';
import useDynamicSvgImport from "../hooks/useDynamicSvgImport";

const CustomSvgIcon = ({ name, location, onCompleted, onError, ...rest }) => {
    const { error, loading, SvgIcon } = useDynamicSvgImport(name, {
        onCompleted,
        onError
    });

    if (SvgIcon) {
        return <SvgIcon {...rest} style={{fontSize: '20px'}} />;
    }

    if (loading) {
        return "Loading...";
    }

    return null;
};

export default CustomSvgIcon;