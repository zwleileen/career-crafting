import { createContext, useEffect, useState } from 'react';
import * as valuesService from '../services/valuesService';
import * as careerService from "../services/careerService"
import * as imagineService from "../services/imagineService"


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
  const [imagesIds, setImagesIds] = useState([]);

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
                const images = await imagineService.showUserId(user._id);
                if (images && Array.isArray(images)) {
                    setImagesIds(images.map(img => img.responseId));
                }
            } catch (error) {
                console.error("Error fetching ids:", error);
            }
        }
    };
    fetchIds();
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, valuesId, careersId, imagesIds }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
