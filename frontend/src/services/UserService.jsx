import api from '../api'; // Path to your api.js

export const UserService = {
  // Fetch a single profile by email
  getProfile: async (email) => {
    const response = await api.get(`/users/${email}`);
    return response.data;
  },

  // Search users by skill and minimum score
  searchBySkill: async (skillName, minScore = 1) => {
    const response = await api.get(`/users/search/by-skill`, {
      params: { 
        skill_name: skillName, 
        min_score: minScore 
      }
    });
    return response.data;
  }
};