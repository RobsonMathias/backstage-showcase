import { UIhelper } from '../utils/UIhelper';
import { Common } from '../utils/Common';
import {UIhelperPO} from '../support/pageObjects/global-obj';

describe('Search', () => {
  before(() => {
    Common.clearAllStorage();
    Common.loginAsGuest();
  });

  it('should search list return results successfully', () => {
    UIhelper.clickButton('Search');
    UIhelper.verifyRowsInTable(['Browser Event Sink'], UIhelperPO.MuiListItem);
    UIhelper.clickButtonByAriaLabel('close');
  })

});
