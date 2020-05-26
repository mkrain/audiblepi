
namespace Audible.Interfaces.Messages.Settings
{
    public class NoteIntervalChangedMessage : MessageBase<int>
    {
        public NoteIntervalChangedMessage()
        {

        }

        public NoteIntervalChangedMessage(int data) : base(data)
        {

        }

        public NoteIntervalChangedMessage(int data, object sender) : base(data, sender)
        {

        }

        public NoteIntervalChangedMessage(int data, object sender, string key) : base(data, sender, key)
        {

        }
    }
}