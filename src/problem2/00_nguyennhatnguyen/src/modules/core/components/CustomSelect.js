import React, {useMemo, useState} from 'react';
import {AutoComplete, Input} from 'antd';
import styled from "styled-components";
import CustomSvgIcon from "./CustomSvgIcon";
import Icon  from '@ant-design/icons';

const CustomSelect = ({ items = [], selectedItem, handleSelected }) => {
    const options = useMemo(() =>{
        return items.map((it, index) => {
            return {
                value: JSON.stringify(it),
                label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                             <CustomSvgIcon name={it.currency} onCompleted={(iconName) => console.log(`${iconName} successfully loaded`)}
                                            onError={(err) => console.error(err.message)} />
                        </span>
                        {it.currency}
                    </div>
                )
            }
        });
    }, [items]);

    const handleSearch = (value) => {
        console.log(value);
    };

    const handleSelect = (value) => {
        console.log(value);
    };

    return (
        <AutoComplete
            popupClassName="certain-category-search-dropdown"
            popupMatchSelectWidth={500}
            style={{ width: 250 }}
            options={options}
            onSearch={handleSearch}
            onSelect={handleSelect}
        >
            <Input.Search size="large" placeholder="input here" />
        </AutoComplete>
    )
};

export default CustomSelect;