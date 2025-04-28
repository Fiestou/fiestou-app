import React from "react";

export interface ResponseRegister {
    response: boolean
    data: DataRegister
}

export interface DataRegister {
    name: string
    description: string
    updated_at: string
    created_at: string
    id: number
}


export interface GroupResponse {
    response: boolean
    data: Group
}

export interface GroupsResponse {
    response: boolean
    data: Group[]
}


export interface Group {
    id: number
    name: string
    description: string
    active: number
    created_at: string
    updated_at: string
    elements: Element[]
}

export interface Element {
    id: number
    name: string
    icon: string
    checked?: boolean
    description?: string
    groupName?: string
    active?: number
    created_at?: string
    updated_at?: string 
    group_id?: number,
    element_related_id?: number[]
}

export interface relatedElement {
    id: number
    name: string
    icon: string
    groupName?: string
}

export interface ElementsResponse {
    response: boolean
    data: Element[]
}

export interface ElementResponse {
    response: boolean
    data: Element
}

export interface GenericResponse { 
    response: boolean, 
    data?: object, 
    nessage?: string 
}