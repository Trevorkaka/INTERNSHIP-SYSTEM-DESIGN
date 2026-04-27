import { useState } from "react"
import axios from "axios"

export default function Login({onLogin}){
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
}