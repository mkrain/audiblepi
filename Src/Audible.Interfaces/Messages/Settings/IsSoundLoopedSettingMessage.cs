
namespace Audible.Interfaces.Messages.Settings
{
    public class IsSoundLoopedSettingMessage : MessageBase<bool>
    {
        public IsSoundLoopedSettingMessage()
        {

        }

        public IsSoundLoopedSettingMessage(bool data) : base(data)
        {

        }

        public IsSoundLoopedSettingMessage(bool data, object sender) : base(data, sender)
        {

        }

        public IsSoundLoopedSettingMessage(bool data, object sender, string key) : base(data, sender, key)
        {

        }
    }
}