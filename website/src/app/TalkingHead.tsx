"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './TalkingHead.module.scss';
import { ReactNode, useState } from "react";
import { useInterval } from 'usehooks-ts';

type WhatSide = 'left' | 'right';

type TalkingHeadProps = {
  image: any;
  description: string;
  whatSide: WhatSide;
  words: string[];
}


interface BarfingTextProps {
  children: ReactNode;
  whatSide: WhatSide
}

const BarfingText = ({ whatSide, children }: BarfingTextProps) => {
  return <span
    className={[whatSide === 'left' ? styles.leftTextContainer : styles.rightTextContainer, styles.textContainer].join(' ')}> <span
    className={styles.text}>{children}</span></span>
}

export const TalkingHead = ({ image, description, whatSide, words, ...props }: TalkingHeadProps) => {
  let numberOfWords = 10;

  const [rotationDegrees, setRotationDegrees] = useState(0); // whatSide === 'right' ? 15 : -15;
  const [spewedWords, setSpewedWords] = useState<string[]>([]); // whatSide === 'right' ? 15 : -15;
  const transformOrigin = `bottom ${whatSide}`;
  const [offset, setOffset] = useState(0);
  const [isSpewing, setIsSpewing] = useState(false);
  useInterval(() => {
    let newOffset = offset + numberOfWords;
    if (newOffset >= words.length) newOffset = 0;
    setOffset(newOffset);
    let newSetOfWords = words.slice(newOffset, newOffset + numberOfWords);
    setSpewedWords(newSetOfWords);
  }, isSpewing ? 4000 : null)

  const toggleSpew = () => {
    let newSpewing = !isSpewing;
    setIsSpewing(newSpewing);
    setOffset(0);
    setSpewedWords(newSpewing ? words.slice(offset, offset + numberOfWords) : []);
    setRotationDegrees(rotationDegrees === 0 ? whatSide === 'right' ? 15 : -15 : 0);
  };
  return <div className="flex flex-col items-center justify-center relative" {...props}>
    <motion.div animate={{ rotate: rotationDegrees, transformOrigin }}>
      <Image src={image}
             onClick={toggleSpew}
             height={300}
             style={{
               overflowY: "hidden",
               height: '170px',
               objectPosition: 'top',
               objectFit: 'cover',
               marginBottom: '1px',
               transformOrigin: transformOrigin
             }} alt={`Top of ${description}`}/>
    </motion.div>
    <Image src={image}
           onClick={toggleSpew}
           height={300}
           style={{
             overflowY: "hidden",
             height: '130px',
             objectPosition: 'bottom',
             objectFit: 'cover',
             zIndex: '100',
           }} alt={`Bottom of ${description}`}/>
    <div className={[whatSide === 'left' ? styles.leftBarfingContainer : styles.rightBarfingContainer].join(' ')}
         style={{ position: "absolute", top: 185, left: whatSide === 'left' ? 210 : 110 }}>
      {spewedWords.map((word, i) => <BarfingText whatSide={whatSide} key={i}>{word}</BarfingText>)}
    </div>
  </div>

};

export default TalkingHead;
