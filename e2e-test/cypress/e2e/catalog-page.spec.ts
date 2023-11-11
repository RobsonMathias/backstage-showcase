import { UIhelper } from '../utils/UIhelper';
import { Common } from '../utils/Common';

describe('Catalog page', () => {
  before(() => {
    Common.clearAllStorage();
    Common.loginAsGuest();
  });

  it('should go to Catalog page and filter by Location successfully', () => {
    UIhelper.openSidebar('Catalog');
    UIhelper.selectMuiBox('Kind', 'Location');
    UIhelper.verifyRowsInTable(['dynamic-plugins-test-templates-location']);
  })

  it('should go to Catalog page and filter by Template successfully', () => {
    UIhelper.openSidebar('Catalog');
    UIhelper.selectMuiBox('Kind', 'Template');
    UIhelper.verifyRowsInTable(['Get Browser Event Sink Tool URL']);
  })
});
