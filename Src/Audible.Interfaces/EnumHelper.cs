
namespace Audible.Interfaces
{
    //public static class EnumHelper
    //{
    //    public static IEnumerable<T> GetValues<T>() where T : struct
    //    {
    //        var enumType = typeof(T);

    //        if (!enumType.IsEnum)
    //            throw new ArgumentException(string.Format(StringKey.FormatStrings.EnumHelper.InvalidEnumType, enumType.Name));

    //        var fields = from field in enumType.GetFields()
    //                     where field.IsLiteral
    //                     select field;
    //        return 
    //            fields
    //            .Select(field => field.GetValue(enumType))
    //            .Select(value => (T)value).ToArray();
    //    }

    //    public static IEnumerable<object> GetValues(Type enumType)
    //    {
    //        if (!enumType.IsEnum)
    //            throw new ArgumentException(string.Format(StringKey.FormatStrings.EnumHelper.InvalidEnumType, enumType.Name));

    //        var fields = from field in enumType.GetFields()
    //                     where field.IsLiteral
    //                     select field;

    //        return fields.Select(field => field.GetValue(enumType)).ToArray();
    //    }
    //}
}