import { Card } from './ui/card';

export default function Credit() {
  return (
    <Card className='w-full max-w-lg mt-5'>
      <div className='px-4'>
        <p className='mb-3 text-center'>
          This <span className='font-bold'>[problem2: Fancy Form]</span> is made
          by <span className='font-bold italic'>@hieudm-7998</span>
        </p>
        <p className='text-center'>If you are interested please check out my information:</p>
        <div className='flex items-center justify-center gap-4 mt-3'>
          <a
            className='underline'
            target='_blank'
            href='https://hews-portfolio.vercel.app/'
          >
            Portfolio
          </a>
          <span>|</span>
          <a
            className='underline'
            target='_blank'
            href='https://github.com/hieudm-7998'
          >
            GitHub
          </a>
          <span>|</span>
          <a
            className='underline'
            target='_blank'
            href='https://www.linkedin.com/in/hieu-do-minh-b2b918245/'
          >
            LinkedIn
          </a>
        </div>
      </div>
    </Card>
  );
}
