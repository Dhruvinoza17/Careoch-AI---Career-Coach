"use client";

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const HeroSection = () => {
    const imageRef = useRef(null);

    useEffect(() => {

        const imageElement = imageRef.current;

        const handleScroll = () => {
            const scrollThreshold = 100;
            const scrollPosition = window.scrollY;
            if (scrollPosition > scrollThreshold) {
                imageElement.classList.add('scrolled');
            } else {
                imageElement.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

  return (
    <section className='w-full pt-36 md:pt-48 pb-10'>
        <div className='space-y-6 text-center'>
            <div className='space-y-6 mx-auto'>
                <h1 className='gradient-title text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl'>
                    Your AI Career Coach for
                    <br />
                    Professional Growth
                </h1>
                <p className='mx-auto max-w-[600px] text-muted-foreground md:text-xl'>
                    Craft standout resumes, tailored cover letters, ace interviews, 
                    and stay ahead with real-time industry trends.
                </p>
            </div>

            <div className='flex justify-center space-x-4'>
                <Link href="/dashboard">
                    <Button size="lg" className="px-8">
                        Get Started
                    </Button>
                </Link>
                <Link href="/dashboard">
                    <Button size="lg" className="px-8" variant="outline">
                        Demo
                    </Button>
                </Link>
            </div>

            <div className='hero-image-wrapper mt-5 md:mt-0'>
                <div ref={imageRef} className='hero-image'>
                    <Image src={"/ban.jpg"} 
                    width={1280} 
                    height={700} 
                    alt="Banner Careoch AI"
                    className='rounded-lg shadow-2x1 border mx-auto'
                    priority
                    /> 
                </div>
            </div>
            
        </div>
    </section>
  )
}

export default HeroSection;