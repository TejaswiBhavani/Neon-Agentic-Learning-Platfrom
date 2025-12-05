import React, { useEffect, useState } from 'react';
import { studyPlanService, learnerService } from '../../services/api';
import { ChevronDown } from 'lucide-react';

const DomainSelector: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [domains, setDomains] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Fetch guest user
        fetch('http://localhost:5000/api/learners/guest_user')
            .then(res => res.json())
            .then(data => setUser(data))
            .catch(err => console.error("Failed to fetch user", err));

        studyPlanService.getDomains().then(res => setDomains(res.data));
    }, []);

    const handleSwitch = async (domainId: string) => {
        if (!user) return;
        try {
            await learnerService.switchDomain(user.id, domainId);
            // Refresh user profile to reflect change
            const res = await learnerService.getProfile(user.id);
            setUser(res.data);
            setIsOpen(false);
            window.location.reload(); // Force reload to refresh graph/plan
        } catch (error) {
            console.error("Failed to switch domain", error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50"
            >
                <span className="font-medium text-gray-700">{user?.current_domain}</span>
                <ChevronDown size={16} className="text-gray-500" />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                    {domains.map(domain => (
                        <button
                            key={domain.id}
                            onClick={() => handleSwitch(domain.id)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${user?.current_domain === domain.id ? 'text-primary font-semibold' : 'text-gray-700'
                                }`}
                        >
                            {domain.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DomainSelector;
