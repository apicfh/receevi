import { FEUser } from "@/types/user";
import { createClient } from "@/utils/supabase-server";
import { AgantContextProvider } from "./AgentContext";
import ChatContactsClient from "./ChatContactsClient";
import { ContactContextProvider } from "./CurrentContactContext";
import ContactResume from "@/components/ui/contact-resume";

export default async function ChatsLayout({ children }: {
    children: React.ReactNode;
}) {
    //TODO LIST https://claude.ai/share/499a83f9-9e91-44ba-9676-c761c48a5602
    const supabase = createClient();

    const { data: allAgentsId } = await supabase.from('user_roles').select('user_id').eq('role', 'agent')
    const agentUserIds = allAgentsId?.map((ag) => ag.user_id)
    let agents: FEUser[] = []
    if (agentUserIds) {
        const { data: agentsFromDB } = await supabase.from('profiles').select('*').in('id', agentUserIds)
        agents = agentsFromDB?.map(ag => {
            return {
                id: ag.id,
                email: ag.email,
                firstName: ag.first_name,
                lastName: ag.last_name,
                role: 'agent'
            }
        }) || []
    }

    let tagList = ["Mima", "Tosi", "Miche", "Rimini"]
    return (
        <ContactContextProvider>
            <AgantContextProvider agents={agents}>
                <div className="p-4 h-full">
                    <div className="shadow-lg z-20 rounded-xl bg-white flex h-full">
                        <div className="w-80 flex-shrink-0">
                            <ChatContactsClient/>
                        </div>
                        <div className="flex flex-col flex-grow">
                            <ContactResume user={{firstName: "Lorenzo", lastName: "Barberi"}} tagList={tagList}/>
                            <div className="flex flex-row flex-grow border-4 border-blue">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
                <script dangerouslySetInnerHTML={{
                    __html: `
                    (function() {
                        // Check if we're in multi-chat mode from URL
                        const urlParams = new URLSearchParams(window.location.search);
                        const hasMultipleChats = urlParams.has('chats') && urlParams.get('chats').includes(',');
                        
                        // Hide contact resume in multi-chat mode
                        const contactResumeContainer = document.getElementById('contact-resume-container');
                        if (hasMultipleChats && contactResumeContainer) {
                            contactResumeContainer.style.display = 'none';
                        }
                        
                        // Listen for changes in selected contacts
                        window.addEventListener('selectedContactsChanged', function(e) {
                            const selectedCount = e.detail.selectedContacts.length;
                            // Update UI based on selected contacts if needed
                        });
                    })();
                    `
                }}/>
            </AgantContextProvider>
        </ContactContextProvider>
    )
}
