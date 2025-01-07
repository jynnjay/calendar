import React, { useEffect, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const App = () => {
  const [user, setUser] = useState(null);
  const [calendarUrl, setCalendarUrl] = useState("");

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const cronofyRedirectUri = process.env.REACT_APP_CRONOFY_REDIRECT_URI;
  const cronofyClientId = process.env.REACT_APP_CRONOFY_CLIENT_ID;

  const handleGoogleSuccess = async (response) => {
    console.log("Google Login Success:", response);
    const idToken = response.credential;
    try {
      setUser({ token: idToken });
      requestCronofyAuthorization();
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error("Google Login Failed:", error);
  };

  const requestCronofyAuthorization = () => {
    const authUrl = `https://app.cronofy.com/oauth/authorize?response_type=code&client_id=${cronofyClientId}&redirect_uri=${encodeURIComponent(
      cronofyRedirectUri
    )}&scope=create_event%20read_events&state=exampleState`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      exchangeCodeForTokens(code);
    }
  }, []);

  const exchangeCodeForTokens = async (code) => {
    try {
      const tokenResponse = await axios.post("/api/exchange-token", { code });
      const { access_token, linking_profile } = tokenResponse.data;
      const profileId = linking_profile.profile_id;
      createCalendar(access_token, profileId);
    } catch (error) {
      console.error("Token Exchange Error:", error.response?.data || error);
    }
  };

  const createCalendar = async (accessToken, profileId) => {
    try {
      const calendarResponse = await axios.post("/api/create-calendar", {
        accessToken,
        profileId,
      });
      console.log("New Calendar Created:", calendarResponse.data);
      setCalendarUrl(calendarResponse.data.calendar_id);
    } catch (error) {
      console.error("Create Calendar Error:", error.response?.data || error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={{ padding: "20px" }}>
        <h1>Scheduling Calendar App</h1>
        {user ? (
          <div>
            <h2>Welcome!</h2>
            <p>Your calendar:</p>
            {calendarUrl ? (
              <p>Calendar ID: {calendarUrl}</p>
            ) : (
              <p>No calendar created yet.</p>
            )}
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;





// import React, { useEffect, useState } from 'react';
// import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
// import axios from 'axios';

// const App = () => {
//   const [user, setUser] = useState(null);
//   const [calendarUrl, setCalendarUrl] = useState('');

//   const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
//   const cronofyClientId = process.env.REACT_APP_CRONOFY_CLIENT_ID;
//   const cronofyClientSecret = process.env.REACT_APP_CRONOFY_CLIENT_SECRET;
//   const cronofyRedirectUri = process.env.REACT_APP_CRONOFY_REDIRECT_URI;
//   const cronofyApiHost = process.env.REACT_APP_CRONOFY_API_HOST;
//   const cronofyDataCenterURL = process.env.REACT_APP_CRONOFY_DATA_CENTER_URL;


//   const handleGoogleSuccess = async (response) => {
//     console.log('Google Login Success:', response);
//     const idToken = response.credential;
//     try {
//       setUser({ token: idToken });
//       requestCronofyAuthorization();
//     } catch (error) {
//       console.error('Login Error:', error);
//     }
//   };

//   const handleGoogleFailure = (error) => {
//     console.error('Google Login Failed:', error);
//   };

//   const requestCronofyAuthorization = () => {
//     const authUrl = `https://app.cronofy.com/oauth/authorize?response_type=code&client_id=${cronofyClientId}&redirect_uri=${encodeURIComponent(cronofyRedirectUri)}&scope=create_event%20read_events&state=exampleState`;
//     window.location.href = authUrl;
//   };

//   useEffect(() => {
//     console.log('useEffect triggered'); // Debugging
  
//     const urlParams = new URLSearchParams(window.location.search);
//     const code = urlParams.get('code');
  
//     console.log('Authorization Code:', code); // Debugging
  
//     if (code) {
//       exchangeCodeForTokens(code);
//     }
//   }, []);
//   console.log('Window Location Search:', window.location.search); // Debugging

  

//   const exchangeCodeForTokens = async (code) => {
//     console.log('Exchanging code for tokens...'); // Debugging
  
//     try {
//       const tokenResponse = await axios.post(
//         `${cronofyDataCenterURL}/oauth/token`,
//         {
//           client_id: cronofyClientId,
//           client_secret: cronofyClientSecret,
//           grant_type: 'authorization_code',
//           code: code,
//           redirect_uri: cronofyRedirectUri,
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json; charset=utf-8',
//           },
//         }
//       );
  
//       console.log('Token Response:', tokenResponse.data);
  
//       const accessToken = tokenResponse.data.access_token;
//       const profileId = tokenResponse.data.linking_profile.profile_id;
  
//       createCalendar(accessToken, profileId);
//     } catch (error) {
//       console.error(
//         'Token Exchange Error:',
//         error.response ? error.response.data : error
//       );
//     }
//   };
  

//   const createCalendar = async (accessToken, profileId) => {
//     try {
//       const newCalendarResponse = await axios.post(
//         `${cronofyDataCenterURL}/v1/calendars`,
//         {
//           profile_id: profileId,
//           name: 'My Coaching Calendar',
//           color: '#49BED8',
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             'Content-Type': 'application/json; charset=utf-8',
//           },
//         }
//       );

//       console.log('New Calendar Created:', newCalendarResponse.data);

//       const calendarId = newCalendarResponse.data.calendar_id;

//       // Update UI with the new calendar
//       setCalendarUrl(calendarId);
//     } catch (error) {
//       console.error('Create Calendar Error:', error.response ? error.response.data : error);
//     }
//   };

//   return (
//     <GoogleOAuthProvider clientId={clientId}>
//       <div style={{ padding: '20px' }}>
//         <h1>Scheduling Calendar App</h1>
//         {user ? (
//           <div>
//             <h2>Welcome!</h2>
//             <p>Your calendar:</p>
//             {calendarUrl ? (
//               <p>Calendar ID: {calendarUrl}</p>
//             ) : (
//               <p>No calendar created yet.</p>
//             )}
//           </div>
//         ) : (
//           <GoogleLogin
//             onSuccess={handleGoogleSuccess}
//             onError={handleGoogleFailure}
//           />
//         )}
//       </div>
//     </GoogleOAuthProvider>
//   );
// };

// export default App;
