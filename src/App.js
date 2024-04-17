import './App.css';
import { Table, Button, Modal, message } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { useForm , Controller } from 'react-hook-form';
import apiService from './apiService'; 

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [ file , setFile ] = useState(null);
  const [countries, setCountries] = useState({});
  const [countrydropdown, setCountryDropdown] = useState([]);
  const [states, setStates] = useState({});
  const [statedropdown, setStateDropdown] = useState([]);
  const [cities, setCities] = useState({});
  const [citydropdowm, setCityDropdown] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const { handleSubmit , control , formState: { errors = {} } , reset } = useForm();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const formRef = useRef(null);
 

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setUser(null);
    message.success("Logged out successfully!")
  };

  const handleRegister = (userData) => {
    apiService.registerUser(userData)
    .then(response => {
      console.log(response);
      setShowRegisterForm(false);
      message.success("User added successfully!")
    })
    .catch(error => {
      console.error('Error registering user:', error);
    });
  }

  const handleLogin = (userData) => {
    apiService.loginUser(userData)
    .then(response => {
      message.success("User logged in successfully!")
      const token = response.message;
      setUser(userData);
      setLoggedIn(true);
      localStorage.setItem('token', token);
    })
    .catch(error => {
      console.error('Error logging in:', error);
      message.warning('Invalid Email/Password');
    });
  };
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoggedIn(true);
    };

    apiService.getAllEmployees()
      .then(response => {
        setData(response.data);
      })
      .catch(error => console.error('Error fetching data:', error));

    apiService.getCountries()
    .then(response => {
      setCountryDropdown(response.data);
      const countryMap = {};
      response.data.forEach(country => {
        countryMap[country.id] = country.countryName;
      });
      setCountries(countryMap);
    })
    .catch(error => console.error('Error fetching countries:', error));

    apiService.getAllCities()
    .then(response => {
      const cityMap = {};
      response.data.forEach(city => {
        cityMap[city.id] = city.cityName;
      });
      setCities(cityMap);
    })
    .catch(error => console.error('Error fetching cities:', error));

    apiService.getAllStates()
    .then(response => {
      const stateMap = {};
      response.data.forEach(state => {
        stateMap[state.id] = state.stateName;
      });
      setStates(stateMap);
    })

  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    reset();
    setIsModalVisible(false);
    setSelectedEmployee(null);
  };

  const handleEdit = (record) => {
    setSelectedEmployee(record);
    showModal();
  };

  const handleStateChange = (value) => {
    apiService.getCitiesByState(value)
    .then(response => {
      setCityDropdown(response.data);
    })
    .catch(error => console.error('Error fetching cities by state:', error));
  }

  const handleCountryChange = (value) => {
    apiService.getStatesByCountry(value)
    .then(response => {
      setStateDropdown(response.data);
    })
    .catch(error => console.error('Error fetching states by country:', error));
  }

  const onSubmit = async (formData) => {
    const payload = new FormData();
    payload.append('photo', file);
    payload.append('firstName', formData.firstName);
    payload.append('lastName', formData.firstName);
    payload.append('email', formData.email);
    payload.append('gender', formData.gender);
    payload.append('maritalStatus', formData.maritalStatus);
    // var birthDate = payload.birthDate;
    // var birthDateISO = new Date(birthDate + 'T00:00:00').toISOString();
    // payload.append('birthDate', birthDateISO);
    payload.append('hobbies', formData.hobbies);
    payload.append('salary', formData.salary);
    payload.append('address', formData.address);
    payload.append('country', formData.country);
    payload.append('state', formData.state);
    payload.append('city', formData.city);
    payload.append('zipCode', formData.zipCode);
    payload.append('password', formData.password);

    let apiUrl = 'http://localhost:5055/api/Employees/add-employee/';
    let method = 'POST';

    if(selectedEmployee) {
      apiUrl = 'http://localhost:5055/api/Employees/update-employee/'+selectedEmployee.id;
      method = 'PUT';
    }

    try {
      await apiService[method.toLowerCase()](apiUrl, payload);
  
      const updatedData = await apiService.getAllEmployees();
      setData(updatedData.data);
    } catch (error) {
      console.error('Error adding/updating employee details:', error.message);
    }
  
    handleCancel();
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete ${record.firstName} ${record.lastName}?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        apiService.deleteEmployee(record.id)
        .then(response => {
          if (response.ok) {
            message.success('Employee deleted successfully!');
            fetch('http://localhost:5055/api/Employees/get-all-employees')
            return apiService.getAllEmployees();
          } else {
            message.error('Failed to delete employee.');
          }
        })
        .then(updatedData => {
          setData(updatedData.data);
        })
        .catch(error => {
          console.error('Error deleting employee:', error);
          message.error('Failed to delete employee.');
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const columns = [
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      render: id => countries[id],
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      render: id => states[id],
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: id => cities[id]
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <span>
          <Button type="primary" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="danger" onClick={() => handleDelete(record)}>Delete</Button>
        </span>
      ),
    },
  ];

  return (
    <div className="App">
      {!loggedIn ? (
        <div className="forms-container">
          {showRegisterForm ? (
            <RegisterForm register={handleRegister} />
          ) : (
            <LoginForm login={handleLogin} showRegisterForm={() => setShowRegisterForm(true)} />
          )}
        </div>
      ) : (
      <div className="Table-container">
        <h2>Employee Management</h2>
        <div className="add-button-container">
          <Button type="primary" onClick={showModal}>Add</Button>
          <Button type="primary" onClick={handleLogout}>Logout</Button>
        </div>
        <Table dataSource={data} columns={columns} />
      </div>
      )}
      <Modal
        title="Employee Details"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Close
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit(onSubmit)}>
            Save
          </Button>,
        ]}
      > 
        <form ref={formRef}>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <Controller
                  name="firstName"
                  control={control}
                  defaultValue={selectedEmployee ? selectedEmployee.firstName : ''}
                  rules={{ required: 'First name is required' }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="form-control"
                      id="firstName"
                      maxLength="50"
                    />
                  )}
                />
                <span className="text-danger">{errors.firstName && errors.firstName.message}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <Controller
                  name="lastName"
                  control={control}
                  defaultValue={selectedEmployee ? selectedEmployee.lastName : ''}
                  rules={{ required: 'Last name is required' }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="form-control"
                      id="lastName"
                      maxLength="50"
                    />
                  )}
                />
                <span className="text-danger">{errors.lastName && errors.lastName.message}</span>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Controller
                  name="email"
                  control={control}
                  defaultValue={selectedEmployee ? selectedEmployee.email : ''}
                  rules={{ required: 'Email is required' }} 
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      className="form-control"
                      id="email"
                      maxLength="50"
                    />
                  )}
                />
                <span className="text-danger">
                  {errors.email && errors.email.message}
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Gender</label><br />
                <Controller
                  name="gender"
                  control={control}
                  defaultValue={selectedEmployee ? selectedEmployee.gender : 'M'}
                  render={({ field }) => (
                    <>
                      <div className="form-check form-check-inline">
                        <input
                          {...field}
                          className="form-check-input"
                          type="radio"
                          id="maleGender"
                          value="M"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="maleGender"
                        >
                          Male
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          {...field}
                          className="form-check-input"
                          type="radio"
                          id="femaleGender"
                          value="F"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="femaleGender"
                        >
                          Female
                        </label>
                      </div>
                    </>
                  )}
                />
                <span className="text-danger">
                  {errors.gender && errors.gender.message}
                </span>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="photo">Photo</label>
                <Controller
                  name="photo"
                  control={control}
                  defaultValue={null}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="file"
                      className="form-control-file"
                      id="photo"
                      onChange={handleFileChange}
                    />
                  )}
                />
                <span className="text-danger">
                  {errors.photo && errors.photo.message}
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <div className="form-check">
                  <Controller
                    name="maritalStatus"
                    control={control}
                    defaultValue={selectedEmployee ? selectedEmployee.maritalStatus : false}
                    render={({ field }) => (
                      <input
                        {...field}
                        className="form-check-input"
                        type="checkbox"
                        id="maritalStatus"
                      />
                    )}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="maritalStatus"
                  >
                    Are you married?
                  </label>
                </div>
                <span className="text-danger">
                  {errors.maritalStatus && errors.maritalStatus.message}
                </span>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="birthDate">Birth Date</label>
                <Controller
                  name="birthDate"
                  control={control}
                  defaultValue={selectedEmployee ? selectedEmployee.birthDate : ''}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className="form-control"
                      id="birthDate"
                    />
                  )}
                />
                <span className="text-danger">
                  {errors.birthDate && errors.birthDate.message}
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="hobbies">Hobbies</label>
                <Controller
                  name="hobbies"
                  control={control}
                  defaultValue={selectedEmployee ? selectedEmployee.hobbies : ''}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="form-control"
                      id="hobbies"
                      maxLength="100"
                    />
                  )}
                />
                <span className="text-danger">
                  {errors.hobbies && errors.hobbies.message}
                </span>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="salary">Salary</label>
                <Controller
                  name="salary"
                  control={control}
                  defaultValue={selectedEmployee ? selectedEmployee.salary : null}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      className="form-control"
                      id="salary"
                      min="5000"
                      step="any"
                    />
                  )}
                />
                <span className="text-danger">
                  {errors.salary && errors.salary.message}
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <Controller
                  name="address"
                  control={control}
                  defaultValue={selectedEmployee ? selectedEmployee.address : null}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      className="form-control"
                      id="address"
                      maxLength="500"
                    />
                  )}
                />
                <span className="text-danger">
                  {errors.address && errors.address.message}
                </span>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <Controller
                  name="country"
                  control={control}
                  defaultValue={selectedEmployee ? selectedEmployee.country : null}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="form-control"
                      id="ddlCountry"
                      onChange={(e) => {
                        const dropdownselectedCountry = e.target.value;
                        field.onChange(dropdownselectedCountry);
                        handleCountryChange(dropdownselectedCountry);
                      }}
                    >
                      {countrydropdown.map(country => (
                        <option key={country.id} value={country.id}>{country.countryName}</option>
                      ))}
                    </select>
                  )}
                />
                <span className="text-danger">
                  {errors.country && errors.country.message}
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="state">State</label>
                <Controller
                  name="state"
                  control={control}
                  defaultValue={selectedEmployee ? selectedEmployee.state : null}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="form-control"
                      id="ddlState"
                      onChange={(e) => {
                        const dropdownselectedState = e.target.value;
                        field.onChange(dropdownselectedState);
                        handleStateChange(dropdownselectedState);
                      }}
                    >
                      {statedropdown.map(state => (
                        <option key={state.id} value={state.id}>{state.stateName}</option>
                      ))}
                    </select>
                  )}
                />
                <span className="text-danger">
                  {errors.state && errors.state.message}
                </span>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <Controller
                  name="city"
                  control={control}
                  defaultValue={selectedEmployee ? selectedEmployee.city : null}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="form-control"
                      id="ddlCity"
                    >
                      {citydropdowm.map(city => (
                        <option key={city.id} value={city.id}>{city.cityName}</option>
                      ))}
                    </select>
                  )}
                />
                <span className="text-danger">
                  {errors.city && errors.city.message}
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="zipCode">Zip Code</label>
                <Controller
                  name="zipCode"
                  control={control}
                  defaultValue={selectedEmployee ? selectedEmployee.zipCode : null}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="form-control"
                      id="zipCode"
                      maxLength="6"
                    />
                  )}
                />
                <span className="text-danger">
                  {errors.zipCode && errors.zipCode.message}
                </span>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Controller
                  name="password"
                  control={control}
                  defaultValue={selectedEmployee ? selectedEmployee.password : null}
                  rules={{
                    required: 'Password is required',
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,16}$/,
                      message: 'Password must be 8-16 characters long and contain at least one uppercase letter, one number, and one special character.'
                    }
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="password"
                      className="form-control"
                      id="password"
                      title="Password must be 8-16 characters long and contain at least one uppercase letter, one number, and one special character."
                      required
                    />
                  )}
                />
                <span className="text-danger">
                  {errors.password && errors.password.message}
                </span>
              </div>
            </div>
          </div>
        </form>
      </Modal>
      
    </div>
  );  
}

function LoginForm({ login, showRegisterForm }) {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    login({email,password});
  };

  return (
    <form className='limitedwidth mx-auto' onSubmit={onSubmit}>
      <h2>Login</h2>
      <div className="mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="Username or Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">Login</button>
      <button type="button" className="btn btn-secondary" onClick={showRegisterForm}>Register</button>
    </form>
  );
}

function RegisterForm({ register }) {

  const { handleSubmit } = useForm();

  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');

  const onSubmit = (e) => {
    register({email, password, confirmpassword});
  };

  return (
    <form className='limitedwidth mx-auto' onSubmit={handleSubmit(onSubmit)}>
      <h2>Register</h2>
      <div className="mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="Username or Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Confirm Password"
          value={confirmpassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">Register</button>
    </form>
  );
}

export default App;
