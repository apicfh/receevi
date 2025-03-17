export default function Chats() {

    let tagList = ["Mima", "Tosi", "Miche", "Rimini"]

    return (
        <>
            <ContactResume user={{firstName: "Lorenzo", lastName: "Barberi"}} tagList={tagList}/>
            <div>Seleziona un contatto</div>
        </>
    )
}

import ContactResume from "@/components/ui/contact-resume";
