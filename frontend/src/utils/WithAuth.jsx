import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const WithAuth = (Home) => {
    const AuthComponent = (props)=>{
        const router = useNavigate();
        const isAuthenticate = ()=>{
            if(localStorage.getItem("token")){
                return true;
            }
            return false;
        }
        useEffect(()=>{
            if(!isAuthenticate()){
                router("/login")
            }
        }, [])
        return <Home {...props} />
    }
    return AuthComponent;
}
