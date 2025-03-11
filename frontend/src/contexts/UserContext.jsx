import { createContext, useEffect, useState } from 'react';
import * as valuesService from '../services/valuesService';
import * as careerService from "../services/careerService"
import * as imagineWorldService from "../services/imagineWorldService"


const UserContext = createContext();

const getUserFromToken = () => {
  const token = localStorage.getItem('token');
  // console.log(token);
  if (!token) return null;

  return JSON.parse(atob(token.split('.')[1])).payload;
};

function UserProvider({ children }) {
  const [user, setUser] = useState(getUserFromToken());
  const [valuesId, setValuesId] = useState(null);
  const [careersId, setCareersId] = useState(null);
  const [imagineId, setImagineId] = useState("");

  useEffect(() => {
    const fetchIds = async () => {
        if (user && user._id) {
            try{
                const values = await valuesService.showUserId(user._id);
                if (values && values._id) {
                    setValuesId(values._id);
                }
                const career = await careerService.show(user._id);
                if (career && career._id) {
                    setCareersId(career._id);
                }
                const imagine = await imagineWorldService.showUserId(user._id);
                if (imagine) {
                    setImagineId(imagine[0].referenceId);
                }
            } catch (error) {
                console.error("Error fetching ids:", error);
        }
    }
    };
    fetchIds();
  }, [user]);
  console.log("imagineId:", imagineId)

  return (
    <UserContext.Provider value={{ user, setUser, valuesId, careersId, imagineId }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
