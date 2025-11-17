import { useCallback, useState } from 'react';
import PageLayout from './components/PageLayout';
import IpLookupModal from './components/IpLookupModal';
import OpenIpLookupButton from './components/OpenIpLookupButton';

function App() {
  const [isIpLookupModalOpen, setIsIpLookupModalOpen] = useState(false);

  const toggleIpLookupModal = useCallback((): void => {
    setIsIpLookupModalOpen((prev) => !prev);
  }, []);

  return (
    <PageLayout>
      <OpenIpLookupButton onClick={toggleIpLookupModal} />

      {isIpLookupModalOpen && <IpLookupModal onClose={toggleIpLookupModal} />}
    </PageLayout>
  );
}

export default App;
