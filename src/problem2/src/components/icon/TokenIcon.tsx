import React from 'react';
interface Props {
  token: string;
}

const TokenIcon: React.FC<Props> = ({ token }) => {
  const src = `/tokens/${token}.svg`
  // console.log(src)
  return (
    <div className='shining-effect transition-all duration-300 w-10 h-10'>
      <img src={src} alt={token}  className='w-full h-full'/>
    </div>
  );
};

export default TokenIcon;
