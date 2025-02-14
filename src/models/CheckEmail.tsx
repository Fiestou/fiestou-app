export interface CheckMail {
    response: boolean
    user: User
    redirect: string
  }
  
  export interface User {
    hash: string
    name: string
    email: string
    phone: string
    person: string
    status: number
  }
  