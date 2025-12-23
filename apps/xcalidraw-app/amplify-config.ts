import { ResourcesConfig } from "aws-amplify";
import { AMPLIFY_CONSTANTS } from "./app_constants";

export const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: AMPLIFY_CONSTANTS.USER_POOL_ID,
      userPoolClientId: AMPLIFY_CONSTANTS.USER_POOL_CLIENT_ID,
      signUpVerificationMethod: "code",
      loginWith: {
        email: true,
      },
    },
  },
};
