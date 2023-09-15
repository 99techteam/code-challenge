import { Card } from 'antd';
import styled from 'styled-components';

export const StyledCard = styled(Card)`
  border: 1px solid #ddd;
  box-shadow: ${(props) => props.theme.boxShadow};
  border-radius: ${(props) => props.theme.borderRadiusBase};
  overflow: hidden;
  margin: 20px;
  
  .ant-card-head {
    border: none;
    .ant-card-head-title {
      text-align: left;
      padding: 0 10px;
    }
  }
`;