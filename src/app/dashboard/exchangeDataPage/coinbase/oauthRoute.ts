import axios, { AxiosResponse, AxiosError } from 'axios';

const tokenUrl = 'https://api.coinbase.com/oauth/token';
const userDataUrl = 'https://api.coinbase.com/v2/user';

interface TokenResponse {
    access_token: string;
}

interface UserData {
    id: string;
    name: string;
}

const data = {
    grant_type: 'authorization_code',
    code: 'AUTHORIZATION_CODE_FROM_COINBASE',
    client_id: 'd2949691-3479-41aa-b78f-a094d27120df',
    client_secret: 'bUn1t7gFn0ozA4Lb8I13FswsEq',
    redirect_uri: 'https://nevo.network/',
};

axios.post<TokenResponse>(tokenUrl, data)
    .then((response: AxiosResponse<TokenResponse>) => {
        const accessToken = response.data.access_token;
        return axios.get<{ data: UserData }>(userDataUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'CB-VERSION': '2023-09-26'
            }
        });
    })
    .then((response: AxiosResponse<{ data: UserData }>) => {
        const userData = response.data.data;
        console.log('User Data:', userData);
        // Process the user data as needed
    })
    .catch((error: AxiosError) => {
        console.error('Error:', error.response ? error.response.data : error.message);
    });
