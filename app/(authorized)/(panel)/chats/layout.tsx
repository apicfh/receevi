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
                            <ChatContactsClient />
                        </div>
                        <div className="flex flex-col flex-grow">
                            <ContactResume user={{firstName: "Lorenzo", lastName: "Barberi"}} tagList={tagList}/>
                            <div className="flex flex-row flex-grow border-4 border-blue">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </AgantContextProvider>
        </ContactContextProvider>
    )
}
