namespace Audible.Provider.Ads
{
    public class SmallAdProvider : BaseAdProvider
    {
        public SmallAdProvider(string adUnitId, string applicationId) : this(adUnitId, applicationId, 50, 300)
        {
            
        }

        public SmallAdProvider(
            string adUnitId, 
            string applicationId, 
            int height = 50, 
            int width = 300) : base(adUnitId, applicationId, height, width)
        {
        }
    }
}