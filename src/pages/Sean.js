import { useState, useEffect } from 'react';
import LoadModal from '../components/LoadModal/LoadModal';

function Sean() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div>
            <LoadModal loading={loading} />
            <div>
                <h1>Sean</h1>
            </div>
        </div>
    );
}

export default Sean;