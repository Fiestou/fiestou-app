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

export interface GroupsResponse {
    response: boolean
    data: Group[]
}

export interface GroupResponse {
    response: boolean
    data: Group
}

export interface Group {
    id: number
    name: string
    description: string
    parent_id: string
    active: number
    created_at: string
    updated_at: string
    elements: Element[]
}

export interface Element {
    id: number
    name: string
    icon: string
    description: string
    active: number
    created_at: string
    updated_at: string
    laravel_through_key: number
    checked: false,
    descendents?: Element[]
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

const ResponseTypesPage: React.FC = () => {
    return (
        <div>
            <h1>Response Types</h1>
        </div>
    );
};

export default ResponseTypesPage;

