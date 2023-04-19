import Constants from 'expo-constants';

function getProjectID() {
  const PROJECT_ID = Constants?.expoConfig?.extra?.PROJECT_ID;

  if (!PROJECT_ID) {
    throw new Error('PROJECT_ID is missing.');
  }

  return PROJECT_ID;
}

export const Env = {
  PROJECT_ID: getProjectID(),
};
