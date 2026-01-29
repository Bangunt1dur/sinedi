import { useApp } from '../context/AppContext';
import NotificationModal from './NotificationModal';

export default function GlobalDialogs() {
    const { globalAlert, closeAlert } = useApp();

    if (!globalAlert || !globalAlert.show) return null;

    return (
        <NotificationModal
            show={globalAlert.show}
            type={globalAlert.type || 'info'}
            title={globalAlert.title}
            message={globalAlert.message}
            onClose={closeAlert}
        />
    );
}
