
namespace Audible.Interfaces.Messages.Settings
{
    public class SettingsMessage : MessageBase<int>
    {
        public SettingsMessage()
        {

        }

        public SettingsMessage(int data) : base(data)
        {

        }

        public SettingsMessage(int data, object sender) : base(data, sender)
        {

        }

        public SettingsMessage(int data, object sender, string key) : base(data, sender, key)
        {

        }
    }
}