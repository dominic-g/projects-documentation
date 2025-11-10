import React, { type FC, useState, useEffect} from 'react';
import { Box, Anchor } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import './NotFound404.css';

interface NotFound404Props {
    homeUrl: string;
}

const Case = (props: React.PropsWithChildren<any>) => <div className={`case case_${props.num}`} {...props} />;
const CaseFront = (props: React.PropsWithChildren<any>) => <div className="case__front" {...props} />;
const CaseTop = (props: React.PropsWithChildren<any>) => <div className="case__top" {...props} />;
// const CaseLabel = (props: React.PropsWithChildren<any>) => <div className="case__label case__label_right" {...props} />;
const CaseRight = (props: React.PropsWithChildren<any>) => <div className="case__right" {...props} />;
const CaseNumber = (props: React.PropsWithChildren<any>) => <div className="case__number" {...props} />;


const Cases: React.ReactElement[] = [];
for (let i = 1; i <= 47; i++) {
    Cases.push(
        <Case key={i} num={i} className={`case case_${i}`}>
            <CaseFront />
            <CaseTop />
            <div className={`case__label case__label_${i % 4 === 1 || i % 4 === 0 ? 'left' : 'right'}`}></div> 
            <CaseRight />
            <CaseNumber>№2428506</CaseNumber>
        </Case>
    );
}

const GlowBalls: React.ReactElement[] = [];
for (let i = 1; i <= 10; i++) {
    GlowBalls.push(
        <div key={i} className={`glow__ball glow__ball_${i}`}></div>
    );
}

export const NotFound404: FC<NotFound404Props> = ({ homeUrl }) => {
    const BASE_WIDTH = 750;
    const BASE_HEIGHT = 400;

    const [scale, setScale] = useState({ x: 1, y: 1 });

    useEffect(() => {
        const updateScale = () => {
          const x = window.innerWidth / BASE_WIDTH;
          const y = window.innerHeight / BASE_HEIGHT;
          setScale({ x, y });

          document.documentElement.style.setProperty('--x-scale', x.toString());
          document.documentElement.style.setProperty('--y-scale', y.toString());
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    return (
        <Box 
            className="wrapper" 
            style={{ 
                position: 'relative', 
                width: '100%', 
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Box
                className="composition"
                style={{
                  transform: `scaleX(${scale.x}) scaleY(${scale.y})`,
                  // transformOrigin: 'top left',
                }}
            >

                <div className="layer-0 shelf">
                    <div className="shelf__side_left"></div>
                    <div className="shelf__side_bottom"></div>
                    
                    {/* Inject all generated case elements */}
                    {Cases}

                    <div className="glow">
                        <div className="glow__bottom"></div>
                        <div className="glow__top"></div>
                        {GlowBalls}
                    </div>
                    
                    <div className="shelf__side_front"></div>
                    <div className="shelf__side_right"></div>
                    
                    <div className="shelf__handle_top"></div>
                    <div className="shelf__handle_front"></div>
                    <div className="shelf__handle_right"></div>
                </div>
                <div className="layer-1 shadow"></div>
                <div className="layer-2 numbers">
                    <div className="numbers__item numbers__item_1">4</div>
                    <div className="numbers__item numbers__item_2">0</div>
                    <div className="numbers__item numbers__item_3">4</div>
                </div>
            </Box>

            {/* Home button overlay */}
            <Anchor
                href={homeUrl || '/'} 
                style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '40px',
                    zIndex: 10000,
                }}
            >
                <IconHome size={40} stroke={2} />
            </Anchor>
        </Box>
    );
};
