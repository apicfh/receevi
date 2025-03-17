'use client'
import React, {useState} from 'react';
import {cn} from "@/lib/utils"
import UserLetterIcon from "@/components/users/UserLetterIcon";
import Tag from "@/components/ui/tag";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {ChevronDown} from "lucide-react";

const ContactResume = (
    {
        user,
        className,
        tagList
    }: {
            user: {firstName: string | null, lastName: string | null},
            className?: string,
            tagList?: string[]
    }
) => {

    let operators = ["Pinco Pallo", "Morta Della"]
    let [selectedOperator, setSelectedOperator] = useState("Assegna ad un operatore")

    return (
        <div className="contact-resume flex w-full px-4 py-2">
            <div className="flex row-auto gap-2 items-center w-full">
                <UserLetterIcon user={user} className={cn("cursor-pointer h-10 w-10", className)}/>
                <div className="flex flex-col gap-1">
                    <h3>{cn(user?.firstName, user?.lastName)}</h3>
                    <Tag name="Zona 1" color="blue" className="text-xs"/>
                </div>
            </div>
            <div className="flex flex-col gap-2 items-end justify-center w-full">
                <div id="tagList" className="flex row-auto gap-1 items-center justify-end w-full">
                    {
                        tagList && tagList.map((name, index) => (
                        <Tag key={index} name={name} color="red" className="text-sm"/>
                        ))
                    }
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="bg-secondary text-black px-4 py-2 rounded flex items-center justify-between min-w-32">
                        <span>{selectedOperator}</span>
                        <ChevronDown className="h-4 w-4 ml-2"/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {operators.map((operator, index) => (
                            <DropdownMenuItem
                                key={index}
                                onClick={() => setSelectedOperator(operator)}
                            >
                                {operator}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

export default ContactResume;