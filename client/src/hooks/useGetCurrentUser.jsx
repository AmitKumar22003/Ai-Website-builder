import React from "react";
import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { useDispatch } from "react-redux";

function useGetCurrentUser() {
  const dispatch=useDispatch()
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/me`, {
          withCredentials: true})
     dispatch(setUserData(result.data))
     console.log(result)
      } catch (error) {
        console.log(error);
      }
    }
    getCurrentUser();
  }, []);
}


export default useGetCurrentUser;
