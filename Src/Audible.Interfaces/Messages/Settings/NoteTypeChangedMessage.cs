namespace Audible.Interfaces.Messages.Settings
{
    public class NoteTypeChangedMessage : MessageBase<Provider.NoteType>
    {
        public NoteTypeChangedMessage()
        {

        }

        public NoteTypeChangedMessage(Provider.NoteType data) : base(data)
        {

        }

        public NoteTypeChangedMessage(Provider.NoteType data, object sender) : base(data, sender)
        {

        }

        public NoteTypeChangedMessage(Provider.NoteType data, object sender, string key) : base(data, sender, key)
        {

        }
    }
}