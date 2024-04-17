import axios from 'axios';

const API_BASE_URL = 'http://localhost:5055/api';

const apiService = {

    registerUser: async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/Authentication/register`, userData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error('Error registering user');
        }
    },

    loginUser: async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/Authentication/login`, userData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error('Error logging in');
        }
    },

    fetchData: async (url) => {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            throw new Error('Error fetching data');
        }
    },

    getAllEmployees: () => {
        return axios.get(`${API_BASE_URL}/Employees/get-all-employees`);
    },
    getCountries: () => {
        return axios.get(`${API_BASE_URL}/Country/get-countries`);
    },
    getAllCities: () => {
        return axios.get(`${API_BASE_URL}/City/get-all-cities`);
    },
    getAllStates: () => {
        return axios.get(`${API_BASE_URL}/States/get-all-states`);
    },
    getCitiesByState: (stateId) => {
        return axios.get(`${API_BASE_URL}/City/get-cities-by-state/${stateId}`);
    },
    getStatesByCountry: (countryId) => {
        return axios.get(`${API_BASE_URL}/States/get-states-by-country/${countryId}`);
    },
    addEmployee: (employeeData) => {
        return axios.post(`${API_BASE_URL}/Employees/add-employee/`, employeeData);
    },
    updateEmployee: (employeeId, employeeData) => {
        return axios.put(`${API_BASE_URL}/Employees/update-employee/`+employeeId, employeeData);
    },
    deleteEmployee: (employeeId) => {
        return axios.delete(`${API_BASE_URL}/Employees/delete-employee/${employeeId}`);
    },
};

export default apiService;
