import { UserData } from '../UserDataContext';
import { createUserDataGetter, createUserDataMutation } from './hooks';

export const useLastVisitInfo = createUserDataGetter(userData => {
  return {
    lastVisitDate: userData.lastVisitDate,
    consecutiveVisits: userData.consecutiveVisits,
    numPageviews: userData.numPageviews,
    pageviewsPerDay: userData.pageviewsPerDay,
  };
});
export const useSetLastVisitDate = createUserDataMutation(
  (
    userData,
    {
      lastVisitDate,
      lastViewedModule,
    }: { lastVisitDate: number; lastViewedModule?: string }
  ) => {
    const timeSinceLastVisit = lastVisitDate - userData.lastVisitDate;
    const oneDay = 1000 * 60 * 60 * 20,
      twoDays = 1000 * 60 * 60 * 24 * 2;

    const changes: Partial<UserData> = {};
    if (timeSinceLastVisit >= oneDay && timeSinceLastVisit <= twoDays) {
      changes['lastVisitDate'] = lastVisitDate;
      changes['consecutiveVisits'] = userData.consecutiveVisits + 1;
    } else if (timeSinceLastVisit > twoDays) {
      changes['lastVisitDate'] = lastVisitDate;
      changes['consecutiveVisits'] = 1;
    }
    changes['numPageviews'] = userData.numPageviews + 1;
    changes['pageviewsPerDay'] = { ...userData.pageviewsPerDay };

    const todayDate = new Date(lastVisitDate);
    todayDate.setHours(0, 0, 0, 0);
    const todayDateTimestamp = todayDate.getTime();
    if (todayDateTimestamp in changes.pageviewsPerDay) {
      changes.pageviewsPerDay[todayDateTimestamp]++;
    } else {
      changes.pageviewsPerDay[todayDateTimestamp] = 1;
    }

    if (lastViewedModule) {
      changes.lastViewedModule = lastViewedModule;
    }

    return changes;

    // if (this.firebaseUserDoc) {
    //   setDoc(
    //     this.firebaseUserDoc,
    //     {
    //       ...changes,
    //       numPageviews: this.numPageviews,
    //       pageviewsPerDay: {
    //         [todayDateTimestamp]: this.pageviewsPerDay[todayDateTimestamp],
    //       },
    //     },
    //     { merge: true }
    //   );
    // }
  }
);
