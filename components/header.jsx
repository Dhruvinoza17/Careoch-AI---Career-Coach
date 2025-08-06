import React from 'react'
import { SignedOut, SignedIn, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, StarsIcon, ChevronDown, FileText, PenBox, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { checkUser } from '@/lib/checkUser'

const Header = async () => {
  await checkUser();


  return (
    <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 
        supports-[backdrop-filter]:bg-background/60'>
        <nav className='container mx-auto px-4 h-16 flex items-center justify-between'>
            <Link href="/">
                <Image 
                    src="/go1.png" 
                    alt="Careoch logo" 
                    width={200} 
                    height={60} 
                    className="h-15 py-1 w-auto object-contain" 
                />
            </Link>

            <div className='flex items-center space-x-2 md:space-x-4'>
                <SignedIn>
                    <Link href='/dashboard'>
                        <Button variant="outline">
                            <LayoutDashboard className="h-4 w-4"/>
                            <span className='hidden md:block'>Industry Insights</span>
                        </Button>
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button>
                                <StarsIcon className="h-4 w-4"/>
                                <span className='hidden md:block'>Growth Tools</span>
                                <ChevronDown className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>
                                <Link href="/resume" className='flex items-center gap-2 shadow-none'>
                                    <FileText className="h-4 w-4"/>
                                    <span>Build Resume</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link href="/ai-cover-letter" className='flex items-center gap-2 shadow-none'>
                                    <PenBox className="h-4 w-4"/>
                                    <span>Cover Letter</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link href="/interview" className='flex items-center gap-2 shadow-none'>
                                    <GraduationCap className="h-4 w-4"/>
                                    <span>Interview Prep</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SignedIn>

                <SignedOut>
                    <SignInButton>
                        <Button variant="outline">
                            Sign In
                        </Button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <UserButton 
                        appearance={{
                            elements: {
                                avatarBox: 'h-10 w-10',
                                userButtonPopoverCard: 'shadow-x1',
                                userPreviewMainIdentifier: 'font-semibold',
                            }
                        }}    
                        fallbackRedirectUrl='/'
                    />
                </SignedIn>
            </div>
        </nav>
  </header>
  )
}

export default Header