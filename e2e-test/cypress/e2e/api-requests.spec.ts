import { UIhelper } from '../utils/UIhelper';
import { Common } from '../utils/Common';
import {RequestHelper} from '../utils/RequestHelper';

describe('API Request', () => {
  before(() => {
    Common.clearAllStorage();
    Common.loginAsGuest();
  });

  it('should api/catalog/locations API return 200 and empty data', () => {
    RequestHelper.get('http://localhost:7007/api/catalog/locations').then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal([]);
    });
  })

  it('should api/events/http/test-dynamic-plugins API return 200 and empty data', () => {
    RequestHelper.post('http://localhost:7007/api/events/http/test-dynamic-plugins').then((response) => {
      expect(response.status).to.equal(202);
      expect(response.body).to.deep.equal({
        "status": "accepted"
      });
    });
  })

  it('should api/explore/tools API return 200 and empty data', () => {
    RequestHelper.get('http://localhost:7007/api/explore/tools').then((response) => {
      expect(response.status).to.equal(200);
      // TODO: Do we need to verify the response body with complex data?
      // expect(response.body).to.deep.equal({
      //   "tools": [
      //     ...
      //   ]
      // });
    });
  })

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
