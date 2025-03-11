import { createContext, useEffect, useState } from 'react';
import * as valuesService from '../services/valuesService';
import * as careerService from "../services/careerService";
import * as imagineWorldService from "../services/imagineWorldService";
import * as authService from "../services/authService";

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

  const refreshUser = async () => {
    if (!user || !user._id) return;
  
    try {
        console.log("Refreshing user token for user ID:", user._id);
        
        await authService.refreshToken(user._id);
        
        const updatedUser = getUserFromToken();
        setUser(updatedUser);
        
        console.log("User refreshed from token:", updatedUser);
      } catch (error) {
        console.error("Error refreshing user token:", error);
      }
    };
      
    // Initial token refresh effect
  useEffect(() => {
    const refreshOnMount = async () => {
      const initialUser = getUserFromToken();
      if (initialUser && initialUser._id) {
        try {
          console.log("Initial token refresh for user:", initialUser._id);
          await authService.refreshToken(initialUser._id);
          setUser(getUserFromToken()); // Update with fresh token data
        } catch (error) {
          console.error("Error with initial token refresh:", error);
        }
      }
    };
    
    refreshOnMount();
  }, []); // This effect runs once on mount with no dependencies // Empty dependency array to only run once on mount
    
    console.log("Current user in context:", user);


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
//   console.log("Ids:", valuesId, careersId, imagineId);

  return (
    <UserContext.Provider value={{ user, setUser, valuesId, careersId, imagineId, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
