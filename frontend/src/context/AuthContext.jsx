import { Children, createContext, useState , useContext} from "react";
import axios from 'axios';
import httpStatus from "http-status";
import { useNavigate } from "react-router";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: "http://13.51.167.41/api/v1/user",
})

export const AuthProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  const [userData, setUserData] = useState(authContext);
  const router = useNavigate();

  const handleRegister = async (name, userName, email, password) => {
    try {
      let req = await client.post("/register", {
        name: name,
        username: userName,
        email: email,
        password: password
      })
      if (req.status === httpStatus.CREATED) {
        router("/login");
        return req.data.message;
      }
    } catch (e) {
      throw e;
    }
  }

  const handleLogin = async (username, password) => {
    try {
      let req = await client.post("/login", {
        username: username,
        password: password,
      })
      if (req.status === httpStatus.OK) {
        localStorage.setItem("token", req.data.token);
        setTimeout(router('/home'), 2000);
      }
    }
    catch (e) {
      throw e;
    }
  }

  const getHistoryOfUser = async()=>{
    try{
      let request = await client.get("/get_all_activity", {
        params:{
          token: localStorage.getItem('token')
        }
      });
      return request.data;
    }catch(e){ throw e};
  }
  
  const addUserHistory = async (meetingCode)=>{
    try{
      let request = await client.post("/add_to_activity", {
          token: localStorage.getItem("token"),
          meetingId: meetingCode,
      })
      return request;
    }catch(e){throw e};
  }

  const data = {
    userData, setUserData, handleRegister, handleLogin, getHistoryOfUser, addUserHistory
  }
  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  )
}