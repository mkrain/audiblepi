using System.Runtime.Serialization;

namespace Coding4Fun.AppsListControl
{
    [DataContract]
    public class MarketplaceApp
    {
        [DataMember]
        public string Id { get; set; }
        [DataMember]
        public string AppLink { get; set; }
        [DataMember]
        public string Title { get; set; }
        [DataMember]
        public string ShortDescription { get; set; }
        [DataMember]
        public int UserRatingCount { get; set; }
        [DataMember]
        public string Version { get; set; }
        [DataMember]
        public double AverageUserRating { get; set; }
        [DataMember]
        public string DisplayPrice { get; set; }
        [DataMember]
        public string PriceCurrencyCode { get; set; }
        [DataMember]
        public string ReleaseDate { get; set; }
        [DataMember]
        public string PrimaryImageUrl { get; set; }
    }
}
